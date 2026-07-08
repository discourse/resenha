// Non-public rooms get a variant of the base icon with a lock badge; the
// composed symbols live in svg-icons/resenha-icons.svg. Keep the icon names
// in sync with Resenha::RoomHashtagDataSource.
export default function roomIcon(room) {
  const base = room.room_type === "stage" ? "podcast" : "microphone-lines";
  return room.public ? base : `resenha-${base}-lock`;
}
