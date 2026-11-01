export type ExportMetadata = {
    link: string;
    date: Date;
    creator: string;
};

const escapeXml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Dublin Core in RDF is what Inkscape and other tools read as document metadata
export function embedMetadata(svg: string, { link, date, creator }: ExportMetadata): string {
    const metadata =
        '<metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">' +
        '<rdf:Description rdf:about="">' +
        `<dc:source>${escapeXml(link)}</dc:source>` +
        `<dc:date>${date.toISOString()}</dc:date>` +
        `<dc:creator>${escapeXml(creator)}</dc:creator>` +
        '</rdf:Description></rdf:RDF></metadata>';

    // the metadata opens the document, right after the root tag
    return svg.replace(/^<svg[^>]*>/, (root) => root + metadata);
}
