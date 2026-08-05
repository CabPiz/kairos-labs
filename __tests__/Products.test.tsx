import React from "react";
import { render } from "@testing-library/react";
import { Products } from "@/components/sections/Products";

describe("Products", () => {
  it("renderiza a section de produtos sem erros", () => {
    const { container } = render(<Products />);
    const section = container.querySelector("section#products");
    expect(section).toBeInTheDocument();
  });
});
