import hdr01 from "/assets/hdrs/Barce_Rooftop_C_3k.hdr?url";
import hdr02 from "/assets/hdrs/Serpentine_Valley_3k.hdr?url";
import hdr03 from "/assets/hdrs/Etnies_Park_Center_3k.hdr?url";
import hdr04 from "/assets/hdrs/urban_street_04_8k.hdr?url";
import hdr05 from "/assets/hdrs/Zion_7_Sunsetpeek_Ref.hdr?url";

const HDR_OPTIONS = {
  keys: [
    "Barcelona Rooftop",
    "Serpentine Valley",
    "Etnies Park",
    "Urban Street",
    "Sunset Peek",
  ],
  urls: [hdr01, hdr02, hdr03, hdr04, hdr05],
  urlForKey(key) {
    return this.urls[this.keys.indexOf(key)];
  },
};

export default HDR_OPTIONS;
