import ResenhaRoomForm from "discourse/plugins/resenha/discourse/components/resenha-room-form";

<template>
  <ResenhaRoomForm
    @room={{@controller.model}}
    @onSave={{@controller.saveRoom}}
  />
</template>
