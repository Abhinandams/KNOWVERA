type Props = {
  title?: string
  children: React.ReactNode
}

const Card = ({ title, children }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">

      {title && (
        <h3 className="font-semibold text-gray-800">
          {title}
        </h3>
      )}

      {children}

    </div>
  );
};

export default Card;