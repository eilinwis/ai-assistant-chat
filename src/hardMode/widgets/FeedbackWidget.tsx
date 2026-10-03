import { useEffect, useRef } from 'react'
import { defineFeedbackWidget, FEEDBACK_WIDGET_TAG } from './feedbackWidgetElement'

export default function FeedbackWidget() {
  const slotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    defineFeedbackWidget()
    const element = document.createElement(FEEDBACK_WIDGET_TAG)
    slotRef.current?.append(element)
    return () => element.remove()
  }, [])

  return <div ref={slotRef} className="hm-feedback" />
}
