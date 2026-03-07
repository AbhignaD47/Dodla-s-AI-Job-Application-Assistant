import * as React from "react"

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>((props, ref) => {
    const { children, ...slotProps } = props

    if (React.isValidElement(children)) {
        return React.cloneElement(children, {
            ...slotProps,
            ...children.props,
            ref: (node: HTMLElement) => {
                // Handle child ref
                const childRef = (children as any).ref
                if (typeof childRef === "function") {
                    childRef(node)
                } else if (childRef) {
                    childRef.current = node
                }

                // Handle forwarded ref
                if (typeof ref === "function") {
                    ref(node)
                } else if (ref) {
                    (ref as any).current = node
                }
            },
            className: [slotProps.className, children.props.className]
                .filter(Boolean)
                .join(" "),
        })
    }

    return null
})

Slot.displayName = "Slot"
