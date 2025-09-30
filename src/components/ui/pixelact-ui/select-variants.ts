import { cva } from "class-variance-authority"

export const inputVariants = cva("text-black", {
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