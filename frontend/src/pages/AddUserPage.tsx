import Form from "../components/organisms/BookForm/Form";
import Input from "../components/atoms/Input/Input";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import ActionModal from "../components/organisms/ActionModal/ActionModal";
import { createAdminUser } from "../api/userApi";
import { extractApiErrorMessage } from "../utils/apiError";
import { logAdminActivity } from "../utils/adminActivity";
import Button from "../components/atoms/Button/Button";

const AddUserPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "user",
  });

  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!isCameraOpen || !videoRef.current || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(() => {
      setCameraError("Unable to start video preview. Please retry camera access.");
    });
  }, [isCameraOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      setCameraError("Unable to access camera. Please allow camera permission in your browser.");
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || !isCameraReady || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Camera is not ready yet. Try again in a moment.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Failed to capture photo.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      setCameraError("Failed to capture photo.");
      return;
    }

    setImageFile(new File([blob], `user-${Date.now()}.jpg`, { type: "image/jpeg" }));
    stopCamera();
  };

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCameraError(null);
      setImageFile(file);
      stopCamera();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const fullName = `${form.fname} ${form.lname}`.trim() || form.email;
      await createAdminUser({ ...form, image: imageFile ?? undefined });
      logAdminActivity({
        title: fullName,
        subtitle: "User added by Admin",
      });
      setIsModalOpen(true);
      setForm({
        fname: "",
        lname: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "user",
      });
      setImageFile(null);
      stopCamera();
    } catch (err) {
      setError(extractApiErrorMessage(err, "Failed to create user."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h2 className="text-2xl font-semibold">User Details</h2>
        <p className="text-gray-500 text-sm">
          Enter information to add a new member.
        </p>
      </div>

      {/* Form container */}
      <div className="bg-white rounded-xl shadow-sm p-6">

        <Form
          submitLabel={loading ? "Adding..." : "Add User"}
          onSubmit={handleSubmit}
          uploadSection={
            <div className="w-full h-full p-3 flex flex-col gap-3 items-center justify-center">
              {!isCameraOpen && previewUrl && (
                <img src={previewUrl} alt="User preview" className="h-72 w-full object-cover rounded-lg border border-gray-200" />
              )}
              {isCameraOpen && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => setIsCameraReady(true)}
                  className="h-72 w-full rounded-lg border border-gray-200 object-cover"
                />
              )}
              {!isCameraOpen && !previewUrl && <p className="text-sm text-gray-500">No image selected</p>}

              <div className="flex flex-wrap gap-2 justify-center">
                {!isCameraOpen && (
                  <Button type="button" variant="primary" onClick={startCamera}>
                    Use Camera
                  </Button>
                )}
                {isCameraOpen && (
                  <>
                    <Button type="button" variant="primary" onClick={capturePhoto}>
                      Capture
                    </Button>
                    <Button type="button" variant="ghost" onClick={stopCamera}>
                      Stop
                    </Button>
                  </>
                )}
                <label className="px-4 py-2 rounded-lg font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer">
                  Upload File
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
                {imageFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setImageFile(null);
                      setCameraError(null);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
              {cameraError && <p className="text-xs text-red-600 text-center">{cameraError}</p>}
            </div>
          }
        >
          {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}

          <div>
            <label>First Name</label>
            <Input
              placeholder="John"
              value={form.fname}
              onChange={(event) => setForm((prev) => ({ ...prev, fname: event.target.value }))}
            />
          </div>

          <div>
            <label>Last Name</label>
            <Input
              placeholder="Smith"
              value={form.lname}
              onChange={(event) => setForm((prev) => ({ ...prev, lname: event.target.value }))}
            />
          </div>

          <div>
            <label>Email</label>
            <Input
              placeholder="johnsmith@gmail.com"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>

          <div>
            <label>Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </div>

          <div>
            <label>Phone</label>
            <Input
              placeholder="9876543210"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>

          <div>
            <label>Role</label>
            <select
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="col-span-2">
            <label>Address</label>
            <Input
              placeholder="Enter address"
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            />
          </div>

        </Form>

      </div>

      <ActionModal
        isOpen={isModalOpen}
        type="user_added"
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};

export default AddUserPage;
