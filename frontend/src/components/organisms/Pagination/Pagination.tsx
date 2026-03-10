type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: Props) => {
  const pageSet = new Set<number>([
    Math.max(0, currentPage - 1),
    currentPage,
    Math.min(totalPages - 1, currentPage + 1),
  ]);

  const pagesToRender = Array.from(pageSet)
    .filter((page) => page >= 0 && page < totalPages)
    .sort((a, b) => a - b);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={currentPage <= 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &larr;
      </button>

      {pagesToRender.map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded ${
            currentPage === page ? "bg-emerald-600 text-white" : ""
          }`}
        >
          {page + 1}
        </button>
      ))}

      <button
        type="button"
        aria-label="Next page"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &rarr;
      </button>
    </div>
  );
};

export default Pagination;
