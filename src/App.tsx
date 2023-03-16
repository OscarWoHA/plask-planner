import { set, sub } from "date-fns"
import { useEffect, useState } from "react"
import programJson from "./program.json"

type Event = {
  speaker: string,
  trackId: string,
  slotId: string,
  title: string,
  description: string
  type: string;
}

function CurrentEvent({ trackId, title, description, speaker, type}: Event) { 
  const track = programJson.tracks.find(track => track.id === trackId)

  return <section className="bg-white mb-10 p-5 rounded shadow-lg">
    <h4 className="text-slate-500 font-medium mb-2">Akkurat nå</h4>
    <h3 className="text-xl font-bold">{title}</h3>
    {speaker ? <p className="mb-3 text-slate-500">{speaker} ({type})</p> : null}
    {description ? <p className="leading-relaxed text-slate-700 mb-3">{description}</p> : null}
    {track ? <p className="text-sm">{track.name}</p> : null}
  </section>
}

type EventProps = Event & {
  id: string,
  selected: boolean,
  toggleEvent: () => void
}

function Event({ title, description, selected, speaker, toggleEvent, trackId }: EventProps) {
  const track = programJson.tracks.find(track => track.id === trackId)

  return <section className="border-b-2 py-5">
    <h3 className="text-lg font-bold">
      <input type="checkbox" checked={selected} id="goingCheckbox" className="mr-1 checked:bg-green-500 bg-red-500 rounded appearance-none w-4 h-4" onChange={toggleEvent} />{title}</h3>
    <p className="mb-3 text-slate-500">{speaker}</p>
    <p className="leading-relaxed text-slate-700 mb-3">{description}</p>
    <p className="text-sm">{track?.name}</p>
  </section>
}

type SlotProps = {
  label: string,
  id: string
}

function Slot(slot: SlotProps) {
  const events = programJson.events.filter(event => event.slotId === slot.id).map(event => ({ ...event, id: `${slot.id}_${encodeURIComponent(event.title)}` }))
  const [selected, setSelected] = useState(localStorage.getItem("slot_event_selected_" + slot.id) || undefined)

  const toggleEvent = (id: string) => {
    if (selected === id) {
      localStorage.removeItem("slot_event_selected_" + slot.id)
      setSelected(undefined)
    } else {
      localStorage.setItem("slot_event_selected_" + slot.id, id)
      setSelected(id)
    }
  }

  return <div key={slot.id} className="p-5 bg-white shadow-lg">
    <p className="font-bold">{slot.label}</p>

    <div className="grid gap-5">
      {events.map(event => <Event {...event} key={event.id} selected={selected === event.id} toggleEvent={() => toggleEvent(event.id)} />)}
    </div>
  </div>
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())

  const currentSlot = programJson.slots.filter(slot => {
    const [hours, minutes] = slot.label.split(":")
    const slotTime = sub(set(new Date(), { hours: +hours, minutes: +minutes }), { minutes: 5})

    return currentTime > slotTime
  }).pop()

  const currentEvent = programJson.events.find(event => {
    if (!currentSlot) {
      return false
    }

    const currentSlotSelected = localStorage.getItem("slot_event_selected_" + currentSlot.id)

    const eventId = `${currentSlot.id}_${encodeURIComponent(event.title)}`

    return event.slotId === currentSlot.id && currentSlotSelected === eventId
  })

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)

    return () => clearInterval(interval)
  }, [])

  return <div className="p-10">
    {currentEvent ? <CurrentEvent {...currentEvent} /> : <section className="bg-white mb-10 p-5 rounded shadow-lg">
      <h4 className="text-slate-500 font-medium mb-2">Akkurat nå</h4>
      <h3 className="text-xl">Velg en lyntale nedenfor!</h3>
    </section>}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {programJson.slots.map(slot => <Slot {...slot} key={slot.id} />)}
    </div>
  </div>
}

export default App
