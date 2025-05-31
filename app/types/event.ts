// types/event.ts

/**
 * Represents the raw data structure for an event,
 * likely from a data source such as a spreadsheet or database.
 */
export interface EventRow {
  Titel: string; // Title
  Kategori: string; // Category
  Beskrivning: string; // Description
  'Kort beskrivning': string; // Short description
  Medverkande: string; // Participants/Contributors
  'Ansvarig PLX': string; // Responsible PLX
  Startdatum: string;    // ISO date, e.g., "2025-08-14" (Start Date)
  Slutdatum: string;     // ISO date (End Date)
  Plats: string; // Location
  'Länk till event': string; // Link to event
  'Länk utvalda bilder': string; // Link to selected images (Can be a single URL or multiple, comma-separated)
  'Länk alla bilder': string;    // Link to all images (Same as above)
  Kommentar: string; // Comment
  Övrigt: string; // Other/Miscellaneous
}

/**
 * Defines the structure for individual image information.
 * Used to provide a more structured image list than just URL strings.
 */
export interface ImageInfo {
  url: string;      // URL to the image
  alt?: string;     // Alternative text for the image (good for accessibility)
  id?: string;      // Unique ID for the image, e.g., from Google Drive
}

/**
 * Represents an event along with a processed list of images.
 * This type is likely used in components to display event information.
 * The 'images' property would be populated by processing the links
 * from 'Länk utvalda bilder' or 'Länk alla bilder' in EventRow.
 */
export interface EventWithImages extends EventRow {
  // An array of image objects. If the images are just simple URLs, you
  // could alternatively use: images: string[];
  images: ImageInfo[]; 
  
  // You can also add other processed or derived fields here,
  // e.g., if you want to convert Startdatum and Slutdatum to Date objects.
  // startDateTime?: Date;
  // endDateTime?: Date;
}