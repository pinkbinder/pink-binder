// Hoisted: this formatter is constructed once, not per post card.
const POST_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatPostDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return POST_DATE_FORMAT.format(parsedDate)
}
