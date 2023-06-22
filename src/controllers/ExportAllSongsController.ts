import { IncomingMessage, ServerResponse } from "http";
import { Song } from "../models/Song";
import { SongsRepository } from "../repositories/SongsRepository";

export class ExportAllSongsController {
    songRepository = new SongsRepository();

    async exportAllSongs(req: IncomingMessage, res: ServerResponse) {
        const allSongs: Song[] = await this.songRepository.getAllSongs();
        const csvData = this.convertToCSV(allSongs);

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=songs.csv");

        res.end(csvData);
    }

    convertToCSV(songs: Song[]): string {
        const header = Object.keys(songs[0]).join(",") + "\n";
        const rows = songs.map(song => Object.values(song).join(",")).join("\n");
        return header + rows;
    }
}
