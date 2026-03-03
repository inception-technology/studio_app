type AuthSuspenseFallbackProps = {
  message?: string;
  fullPage?: boolean;
};

export default function AuthSuspenseFallback({
  message = "Loading...",
  fullPage = false,
}: AuthSuspenseFallbackProps) {
  if (fullPage) {
    return (
      <section className="right-container-section">
        <div className="inner-container">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </section>
    );
  }

  return <p className="text-sm text-gray-600">{message}</p>;
}
