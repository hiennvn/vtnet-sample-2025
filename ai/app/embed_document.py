from datetime import time
import sys
import logging
import threading
from watchdog.observers import Observer
from watchdog.events import FileCreatedEvent, FileDeletedEvent, FileSystemEvent, FileSystemEventHandler, DirCreatedEvent, DirDeletedEvent
from ollama import Client
from app.store import RAG
from app import consts


logger = logging.getLogger(__name__)
stream_handler = logging.StreamHandler(sys.stdout)
logger.addHandler(stream_handler)
logger.setLevel(logging.DEBUG)


class FileHandler(FileSystemEventHandler):
    def __init__(self, rag: RAG, *args, **kwargs) -> None:
        self.rag = rag
        super().__init__(*args, **kwargs)

    def on_created(self, event: DirCreatedEvent | FileCreatedEvent) -> None:
        try:
            if isinstance(event, DirCreatedEvent):
                return

            filename = self.get_filename(event)
            if filename:
                project_id = self.get_project_id(event)
                metadata = {
                    "project_id": project_id,
                }
                logger.info(f"File {filename} created")
                ids = self.rag.ingest_documents([filename], metadata)
                if ids and len(ids) > 0:
                    logger.info(f"Added documents: {ids}")
                else:
                    logger.info("No documents has been added")

            return super().on_created(event)
        except Exception as e:
            logger.error(e)

    def on_deleted(self, event: DirDeletedEvent | FileDeletedEvent) -> None:
        try:
            filename = self.get_filename(event)
            if filename:
                logger.info(f"File {filename} deleted")
                result = self.rag.remove_documents_by_source(filename)
                logger.info(f"Deleted documents status: {result.status}")

            return super().on_deleted(event)
        except Exception as e:
            logger.error(e)

    def get_project_id(self, event: FileSystemEvent) -> str | None:
        filename = self.get_filename(event)
        if filename:
            try:
                return filename.split('/')[4]
            except Exception:
                return None

    def get_filename(self, event: FileSystemEvent) -> str | None:
        if not event.src_path:
            return None

        if isinstance(event.src_path, bytes):
            filename = event.src_path.decode('utf-8')
        else:
            filename = event.src_path

        return filename


def main():
    logger.info('Pulling model nomic-embed-text...')
    ollama_client = Client(consts.OLLAMA_BASE_URL)
    ollama_client.pull('nomic-embed-text', stream=False) 

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
