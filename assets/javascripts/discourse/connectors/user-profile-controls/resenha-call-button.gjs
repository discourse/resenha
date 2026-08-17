import ResenhaCallButton from "../../components/resenha/call-button";

const ResenhaProfileCallButton = <template>
  {{#if @outletArgs.model.resenha_can_call}}
    <li class="resenha-call-button">
      <ResenhaCallButton @user={{@outletArgs.model}} />
    </li>
  {{/if}}
</template>;

export default ResenhaProfileCallButton;
