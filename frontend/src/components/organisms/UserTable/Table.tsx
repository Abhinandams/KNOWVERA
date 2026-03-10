import React from "react";

export type TableColumn<T> = {
  key: string;
  header: string;
  accessor?: keyof T;
  className?: string;
  headerClassName?: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
};

type Props<T> = {
  columns: TableColumn<T>[];
  data: T[];
  rowKey?: (row: T, rowIndex: number) => React.Key;
  emptyMessage?: string;
  tableClassName?: string;
};

const Table = <T,>({
  columns,
  data,
  rowKey,
  emptyMessage = "No records found.",
  tableClassName = "",
}: Props<T>) => {
  return (
    <div className={`overflow-x-auto rounded-xl bg-white shadow-sm ${tableClassName}`}>
      <table className="w-full min-w-[760px] table-fixed">
        <thead className="border-b text-gray-500 text-xs sm:text-sm">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-2 py-2 text-left align-top sm:px-4 sm:py-3 ${col.headerClassName || col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-sm text-gray-800">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-2 py-8 text-center text-sm text-gray-500 sm:px-4">
                {emptyMessage}
              </td>
            </tr>
          )}
          {data.map((row, rowIndex) => (
            <tr key={rowKey ? rowKey(row, rowIndex) : rowIndex} className="border-b hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className={`px-2 py-2 align-top sm:px-4 sm:py-3 ${col.className || ""}`}>
                  {col.render
                    ? col.render(row, rowIndex)
                    : col.accessor
                      ? (
                          <div className="max-w-[12rem] truncate">
                            {row[col.accessor] as React.ReactNode}
                          </div>
                        )
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
