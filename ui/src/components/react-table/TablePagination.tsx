import { PaginationState, Table } from "@tanstack/react-table";
import { FaGreaterThan, FaLessThan } from "react-icons/fa";

interface Props<T extends object> {
  table: Table<T>;
  pageIndex: number;
  pageSize: number;
  pagination: PaginationState;
  debug?: boolean;
}

export const PaginationReactTable = <T extends object>({
  table,
  pageIndex,
  pageSize,
  pagination,
  debug,
}: Props<T>) => {
  return (
    <div className="d-flex justify-content-between ml-5 mr-5 mt-4 pb-4">
      <div>
        <div className="d-flex flex-row align-items-center">
          <span className="mr-1">Show</span>
          <div>
            <select
              className="form-control form-control-sm"
              value={pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 25, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <span className="ml-1">entries.</span>
        </div>
        <div className="d-flex align-items-center justify-content-center mt-1">
          <span className="ml-1">Out of {table.getRowModel().rows.length}</span>
        </div>
      </div>

      <div className="d-flex flex-column align-items-center">
        <div className="d-flex flex-row">
          <button
            className="page-link rounded mr-2"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FaLessThan />
          </button>

          <button
            className="page-link rounded"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <FaGreaterThan />
          </button>
        </div>
        <div>
          <span>
            Page{" "}
            <strong>
              {pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
        </div>
      </div>
      <pre>{debug && JSON.stringify(pagination, null, 2)}</pre>
    </div>
  );
};
