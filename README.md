# Solid-RDF-HexBin-File-Extraction
An HTML page that allows sign-in to a Solid POD and extracts a HexBin file from an RDF file there.

This was based off of (for the Auth and RDF Lib):
https://github.com/solid/profile-viewer-tutorial

This searches an RDF file looking triples that have an object of datatype http://www.w3.org/2001/XMLSchema#hexBinary.
For each one it finds, it takes the predicate of that triple and appends "_OriginalFileName" to it and searches for other triples in the same file with the same subject value and that new predicate value. If one is found, that is taken to be the filename for the file data. If not, then the filename is listed as unknown.
The results are populated into an HTML select box.
The user can then choose one and download it.
