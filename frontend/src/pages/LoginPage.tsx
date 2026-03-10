import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/atoms/Input/Input";
import Button from "../components/atoms/Button/Button";
import photo from "../assets/image.png"
import { login } from "../api/authApi";
import { extractApiErrorMessage } from "../utils/apiError";
const LoginPage = () => {
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const data = await login({ email, password });
    localStorage.setItem("token", data.token);
    if (data.userId !== undefined) localStorage.setItem("userId", String(data.userId));
    if (data.role) localStorage.setItem("role", data.role);
    if (data.email) localStorage.setItem("email", data.email);

    const role = data.role?.toUpperCase();

    if (role === "ADMIN") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  } catch (err) {
    setError(extractApiErrorMessage(err, "Unable to reach server. Please start backend on port 8080."));
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 px-2 py-2 sm:px-4 sm:py-4">
      <div className="grid min-h-[calc(100vh-2rem)] grid-cols-1 overflow-hidden rounded-sm border border-gray-200 bg-white lg:min-h-[calc(100vh-3rem)] lg:grid-cols-12">
        <section className="relative col-span-1 bg-gradient-to-b from-emerald-800 to-emerald-200 p-6 text-white lg:col-span-7 lg:p-12">
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center">
            <div className="mb-6 rounded-2xl border border-white/20 bg-white/10 p-2 text-4xl md:text-6xl">📖</div>
            <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">KNOWVERA</h1>
            <p className="mt-3 text-center text-base text-violet-100 sm:text-xl md:text-3xl">Organizing Knowledge, Empowering Minds</p>

            <img
              src={photo}
              alt="Library interior"
              className="mt-5 min-h-[180px] w-full rounded-3xl object-cover md:min-h-[320px] lg:h-96"
            />

            <p className="mt-6 text-xs tracking-[0.2em] text-black">ENTERPRISE EDITION v2024.1.0</p>
          </div>
        </section>

        <section className="col-span-1 flex items-center justify-center bg-gray-50 p-4 lg:col-span-5 lg:p-8">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900 sm:mb-8 sm:text-3xl">Welcome Back</h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
                {error && <p className="text-sm text-red-600">{error}</p>}
              <Input
                label="Username or Email"
                placeholder="Enter your credentials"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  Remember me
                </label>
                <button type="button" className="font-medium text-emerald-600 hover:text-emerald-700">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-emerald-600 py-3 text-base hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In to Portal"}
              </Button>

            </form>

            <div className="mt-6 border-t border-gray-200 pt-5 text-center text-xs text-gray-500">
              By signing in, you agree to KNOWVERA&apos;s Terms of Service and Privacy Policy
            </div>

            <div className="mt-10 text-center text-xs text-black">
              <p>Help Center  ·  Global Support  ·  System Status</p>
              <p className="mt-2">© 2024 KNOWVERA Library Management Systems Inc.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
