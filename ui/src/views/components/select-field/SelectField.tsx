import Select from "react-select";
import makeAnimated from "react-select/animated";
import { StateManagerProps } from "react-select/dist/declarations/src/useStateManager";

import { SelectOption } from "../../../types/ui/common-ui";

type Props = StateManagerProps & {
  id: string;
  label: string;
};

export const SelectField = ({ id, label, ...props }: Props) => {
  const options = props.options as Array<SelectOption>

  const sortedArray = options.sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <label className="form-control-label" htmlFor={id}>
        {label}
      </label>
      <Select {...props} options={sortedArray} components={makeAnimated()} />
    </>
  )
}
