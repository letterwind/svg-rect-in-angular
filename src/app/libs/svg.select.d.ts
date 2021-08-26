declare module "@svgdotjs/svg.js" {
    interface Element {
        selectize(attr?: boolean): this;
        draw(event: any, options?: any, value?: any): Svg;
        resize(attr?: boolean): this;
    }
}
