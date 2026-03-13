"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = exports.Status = exports.PropertyType = void 0;
var PropertyType;
(function (PropertyType) {
    PropertyType["Appartement"] = "appartement";
    PropertyType["Bureau"] = "bureau";
    PropertyType["Depot"] = "depot";
    PropertyType["Local"] = "local";
    PropertyType["Maison"] = "maison";
    PropertyType["Terrain"] = "terrain";
    PropertyType["Villa"] = "villa";
    PropertyType["Usine"] = "usine";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var Status;
(function (Status) {
    Status["Sale"] = "sale";
    Status["Rent"] = "rent";
})(Status || (exports.Status = Status = {}));
var Location;
(function (Location) {
    Location["Akouda"] = "akouda";
    Location["HammamSousse"] = "hammam_sousse";
    Location["ChattMariem"] = "chatt_mariem";
    Location["Hergla"] = "hergla";
    Location["KalaaSghira"] = "kalaa_sghira";
    Location["KalaaKebira"] = "kalaa_kebira";
    Location["Kantaoui"] = "kantaoui";
    Location["Khzema"] = "khzema";
    Location["Sousse"] = "sousse";
    Location["SidiAbdelhamid"] = "sidi_abdelhamid";
    Location["SidiBouAli"] = "sidi_bouali";
    Location["ZaouietSousse"] = "zaouiet_sousse";
})(Location || (exports.Location = Location = {}));
