import sys
import logging
import threading
from watchdog.observers import Observer
from watchdog.events import FileCreatedEvent, FileDeletedEvent, FileSystemEventHandler, DirCreatedEvent, DirDeletedEvent
from app.store import RAG


logger = logging.getLogger(__name__)
stream_handler = logging.StreamHandler(sys.stdout)
logger.addHandler(stream_handler)
logger.setLevel(logging.DEBUG)


class FileHandler(FileSystemEventHandler):
    def __init__(self, rag: RAG, *args, **kwargs) -> None:
        self.rag = rag
        super().__init__(*args, **kwargs)

    def on_created(self, event: DirCreatedEvent | FileCreatedEvent) -> None:
        if isinstance(event, DirCreatedEvent):
            return

        logger.info(f"File {event.src_path} created")
        return super().on_created(event)

    def on_deleted(self, event: DirDeletedEvent | FileDeletedEvent) -> None:
        if event.src_path:
            if isinstance(event.src_path, bytes):
                filename = event.src_path.decode('utf-8')
            else:
                filename = event.src_path
            logger.info(f"File {filename} deleted")
            deleted = self.rag.remove_documents_by_source(filename)
            logger.info(f"Deleted documents: {deleted}")
        return super().on_deleted(event)


def main():
    watcher = Observer()
    rag = RAG()
    handler = FileHandler(rag)
    watcher.schedule(
        event_handler=handler,
        path='/app/uploads',
        recursive=True,
        event_filter=[FileCreatedEvent, FileDeletedEvent]
    )
    watcher.start()

    ev = threading.Event()

    try:
        logger.info("Watcher is starting...")
        ev.wait()
    except KeyboardInterrupt:
        watcher.unschedule_all()
        watcher.stop()
        watcher.join(timeout=5)

if __name__ == '__main__':
    main()
