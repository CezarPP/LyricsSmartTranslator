CREATE OR REPLACE FUNCTION generate_rss_feed()
    RETURNS XML AS
$$
DECLARE
    rss_feed  XML;
    base_link TEXT := 'https://www.lyricssmarttranslator.com';
BEGIN
    WITH rss_data AS (SELECT s.title                            AS title,
                             s.artist                           AS author,
                             u.username                         AS posted_by,
                             t.time AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Bucharest' AS pubDate,
                             'Check out this amazing new song!' AS description,
                             s.primary_translation              AS primary_translation
                      FROM songs s
                               JOIN translations t ON s.primary_translation = t.id
                               JOIN users u ON u.id = t.user_id
                      ORDER BY s.id DESC
                      LIMIT 10)
    SELECT xmlelement(name "rss",
                      xmlattributes('2.0' AS "version"),
                      xmlelement(name "channel",
                                 xmlelement(name "title", 'Song Feed'),
                                 xmlelement(name "description", 'Stay updated with the latest songs.'),
                                 xmlelement(name "link", base_link),
                                 xmlelement(name "pubDate", '2023-05-24T18:17:19.294'),
                                 (SELECT xmlagg(xmlelement(name "item",
                                                           xmlelement(name "title", rd.title),
                                                           xmlelement(name "author", rd.author),
                                                           xmlelement(name "description", rd.description),
                                                           xmlelement(name "posted_by", rd.posted_by),
                                                           xmlelement(name "link", base_link || '/song-page/' ||
                                                                                   rd.primary_translation),
                                                           xmlelement(name "pubDate", rd.pubDate)
                                     ))
                                  FROM rss_data rd)
                          )
               )
    INTO rss_feed;

    RETURN rss_feed;
END;
$$
    LANGUAGE plpgsql;
