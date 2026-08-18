import { useRouter } from "next/navigation"

export function useViewTransition() {
  const router = useRouter()

  const push = (href: string, direction: "forward" | "back" = "forward") => {
    if (!document.startViewTransition) {
      router.push(href)
      return
    }

    document.documentElement.classList.add(`vt-${direction}`)

    document.startViewTransition(() => {
      router.push(href)
    })

    setTimeout(() => {
      document.documentElement.classList.remove(`vt-${direction}`)
    }, 1100)
  }

  return { push }
}
