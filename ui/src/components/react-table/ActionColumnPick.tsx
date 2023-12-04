import { CellContext } from "@tanstack/react-table";
import { MouseEvent } from "react";

import { Button } from "reactstrap";

export const ActionColumnPick = <T extends { id: string }>(
  info: CellContext<T, unknown>,
  onPickButtonClick: (e: MouseEvent<HTMLButtonElement>) => void
) => {
  if (!info.getValue()) return <></>;
  const id = info.row.original.id.toString();

  return (
    <Button
        id={id}
        size="sm"
        name={`${info.row.index}`}
        className="m-1"
        color="info"
        type="button"
        onClick={onPickButtonClick}
    >
        Pick
    </Button>
  );
};
