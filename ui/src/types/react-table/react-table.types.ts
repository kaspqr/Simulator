import { MouseEvent } from "react";

export interface IDefaultActionButton {
  onPickButtonClick: (e: MouseEvent<HTMLButtonElement>) => void;
}
