import type { VehicleArtworkKind } from "../data/vehicles";

export default function VehicleArtwork({ kind }: { kind: VehicleArtworkKind }) {
  return (
    <svg className={`vehicle-art vehicle-art-${kind}`} viewBox="0 0 600 330" fill="none" aria-hidden="true">
      <ellipse cx="308" cy="279" rx="246" ry="18" fill="#20394B" opacity=".12" />
      {kind === "fire" ? (
        <g stroke="#183348" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M105 135h234v104H105z" fill="#D94B3D" />
          <path d="M126 147h192v79H126z" fill="#E95849" strokeWidth="4" />
          <path d="M129 171h185M164 148v77m48-77v77m48-77v77" stroke="#F6B8A7" strokeWidth="3" />
          <path d="M339 167h103l47 72H339z" fill="#D94B3D" />
          <path d="M359 176h59l34 45h-93z" fill="#D9E8EA" strokeWidth="4" />
          <path d="M115 239h412M364 152h59" />
          <path d="M140 135v-15h55v15m-42-15v-13h30v13" fill="#E5AF32" strokeWidth="5" />
          <path d="M451 167h18v14h-18z" fill="#E5AF32" strokeWidth="4" />
          <circle cx="184" cy="252" r="25" fill="#1A2F40" />
          <circle cx="184" cy="252" r="10" fill="#E7EDEF" strokeWidth="4" />
          <circle cx="440" cy="252" r="25" fill="#1A2F40" />
          <circle cx="440" cy="252" r="10" fill="#E7EDEF" strokeWidth="4" />
          <path d="M100 238h-16v-30h21m394 30h20" />
        </g>
      ) : kind === "rescue" ? (
        <g stroke="#183348" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M107 161h224v76H107z" fill="#E8A72F" />
          <path d="m114 160 10-62h153l13 62z" fill="#E8A72F" />
          <path d="M331 180h98l48 57H331z" fill="#E8A72F" />
          <path d="M351 188h59l34 39h-93z" fill="#D9E8EA" strokeWidth="4" />
          <path d="M122 113h145m-128 16h120" stroke="#F8D77B" strokeWidth="5" />
          <path d="M153 237h364M317 177l77-78 23 12-68 76m-11-11 104-91 14 12-87 79" fill="#5D7888" />
          <path d="m396 100 20-20 14 11-20 20m14-21 33-20 8 10-27 23m-57 84 23 4-5 17" />
          <circle cx="178" cy="250" r="25" fill="#1A2F40" />
          <circle cx="178" cy="250" r="10" fill="#E7EDEF" strokeWidth="4" />
          <circle cx="432" cy="250" r="25" fill="#1A2F40" />
          <circle cx="432" cy="250" r="10" fill="#E7EDEF" strokeWidth="4" />
          <path d="M115 238h-18v-35h19" />
        </g>
      ) : (
        <g stroke="#183348" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M89 114h268v126H89z" fill="#54788E" />
          <path d="m104 128 16-30h222l12 30z" fill="#7695A6" strokeWidth="4" />
          <path d="M111 148h225m-224 19h225m-225 19h225m-225 19h225" stroke="#A9BEC6" strokeWidth="3" />
          <path d="M357 166h90l49 74H357z" fill="#E8A72F" />
          <path d="M376 175h54l34 48h-88z" fill="#D9E8EA" strokeWidth="4" />
          <path d="M89 240h436" />
          <path d="M357 148h57v14" stroke="#F3C757" strokeWidth="5" />
          <circle cx="165" cy="252" r="25" fill="#1A2F40" />
          <circle cx="165" cy="252" r="10" fill="#E7EDEF" strokeWidth="4" />
          <circle cx="425" cy="252" r="25" fill="#1A2F40" />
          <circle cx="425" cy="252" r="10" fill="#E7EDEF" strokeWidth="4" />
          <path d="M100 240H82v-35h19m-2-91h248" />
        </g>
      )}
      <path d="M42 287h510" stroke="#A9B9C0" strokeWidth="2" strokeDasharray="7 10" />
    </svg>
  );
}
