export default function Pagination({

    page,

    totalPages,

    onPageChange

}) {

    return (

        <div className="flex justify-center items-center gap-3 mt-8">

            <button

                disabled={page === 1}

                onClick={() => onPageChange(page - 1)}

                className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-40"

            >

                Previous

            </button>

            <span className="font-semibold">

                Page {page} of {totalPages}

            </span>

            <button

                disabled={page === totalPages}

                onClick={() => onPageChange(page + 1)}

                className="px-4 py-2 rounded-lg bg-navy-600 text-white disabled:opacity-40"

            >

                Next

            </button>

        </div>

    );

}