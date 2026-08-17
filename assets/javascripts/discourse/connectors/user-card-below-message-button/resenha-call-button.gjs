import ResenhaCallButton from "../../components/resenha/call-button";

const ResenhaCardCallButton = <template>
  {{#if @outletArgs.user.resenha_can_call}}
    <li class="user-card-below-message-button resenha-call-button">
      <ResenhaCallButton @user={{@outletArgs.user}} />
    </li>
  {{/if}}
</template>;

export default ResenhaCardCallButton;
