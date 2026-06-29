// filepath: frontend/src/components/common/error-message.jsx
export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="rounded-xl border border-fuchsia/35 bg-fuchsia/12 p-3">
      <p className="text-sm text-fuchsia">{message}</p>
      {onRetry ? (
        <button
          type="button"
          className="mt-2 rounded border border-fuchsia/30 px-2 py-1 text-xs text-fuchsia hover:bg-fuchsia/20"
          onClick={onRetry}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
