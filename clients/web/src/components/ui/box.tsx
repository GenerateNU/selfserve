interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Box({ className, children, ...props }: BoxProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
