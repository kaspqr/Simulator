import { ColumnDef } from "@tanstack/react-table";

import { Machine } from "../../types/domain/machine.model";
import { ActionColumnPick } from "../../components/react-table/ActionColumnPick";
import { IDefaultActionButton } from "../../types/react-table/react-table.types";

export const machinesTableColumns = ({
  onPickButtonClick,
}: IDefaultActionButton): ColumnDef<Machine, unknown>[] => {
  const columns: ColumnDef<Machine>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: info => info.getValue(),
    },
/*     {
      header: "ID",
      accessorKey: "id",
      cell: info => info.getValue(),
    }, */
    {
      header: "",
      accessorKey: "id",
      cell: info => ActionColumnPick(info, onPickButtonClick),
    },
  ];
  return columns;
};
