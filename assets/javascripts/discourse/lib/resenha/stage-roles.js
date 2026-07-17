// Stage rooms gate speaking on the participant's role; every other room type
// lets anyone speak.
export function participantCanSpeak(room, userId) {
  if (room.room_type !== "stage") {
    return true;
  }

  const participant = (room.active_participants || []).find(
    (p) => Number(p?.id) === Number(userId)
  );
  const role = participant?.role;
  return role === "moderator" || role === "speaker";
}
