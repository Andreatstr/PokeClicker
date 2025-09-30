import { cva } from "class-variance-authority"

export const inputVariants = cva("text-black select-none", {
  variants: {
    font: {
      normal: "",
      pixel: "pixel-font",
    },
  },
  defaultVariants: {
    font: "pixel",
  },
})