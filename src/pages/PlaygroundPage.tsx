import ConfirmModal from '../components/playground/ConfirmModal'
import DragAndDrop from '../components/playground/DragAndDrop'
import EventCalendar from '../components/playground/EventCalendar'
import ImageGallery from '../components/playground/ImageGallery'
import ItemFilter from '../components/playground/ItemFilter'
import VideoPlayer from '../components/playground/VideoPlayer'
import VolumeSlider from '../components/playground/VolumeSlider'

export default function PlaygroundPage() {
  return (
    <div className="panel">
      <h2 className="panel__heading">Playground</h2>
      <p className="panel__lede">
        Interactive elements — slider, drag and drop, modal, video player,
        calendar, filter, and an image gallery — for practicing Playwright
        locators, actions, and assertions beyond the Chat screens.
      </p>

      <section className="widget-block" data-testid="playground-section-slider">
        <h3 className="widget-block__heading">Slider</h3>
        <VolumeSlider />
      </section>

      <section className="widget-block" data-testid="playground-section-dnd">
        <h3 className="widget-block__heading">Drag and drop</h3>
        <DragAndDrop />
      </section>

      <section className="widget-block" data-testid="playground-section-modal">
        <h3 className="widget-block__heading">Modal window</h3>
        <ConfirmModal />
      </section>

      <section className="widget-block" data-testid="playground-section-video">
        <h3 className="widget-block__heading">Video player</h3>
        <VideoPlayer />
      </section>

      <section className="widget-block" data-testid="playground-section-calendar">
        <h3 className="widget-block__heading">Calendar</h3>
        <EventCalendar />
      </section>

      <section className="widget-block" data-testid="playground-section-filter">
        <h3 className="widget-block__heading">Filter</h3>
        <ItemFilter />
      </section>

      <section className="widget-block" data-testid="playground-section-gallery">
        <h3 className="widget-block__heading">Image gallery</h3>
        <ImageGallery />
      </section>
    </div>
  )
}
