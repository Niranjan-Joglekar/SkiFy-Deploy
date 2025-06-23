import { Label } from "@/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

export default function Options({ options }: { options: string[] }) {
  return (
    <RadioGroup>
          {options.map((option, index) => (
              <div key={option} className="flex items-center gap-3 my-5 border rounded-md p-3 w-[60vw]">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
              </div>
          ))}
    </RadioGroup>
  )
}
