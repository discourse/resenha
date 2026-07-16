# frozen_string_literal: true

Resenha::Engine.routes.draw do
  resources :rooms do
    member do
      post :join
      post :heartbeat
      delete :leave
      get :participants
      post :signal
      get :chat_session
      post :chat_session, action: :ensure_chat_session, as: :ensure_chat_session
      post :chat_message
      post :toggle_mute
      post :state
      post :livekit_token
      delete :kick
    end

    resources :memberships, controller: "room_memberships", only: %i[index create update destroy]
  end

  # LiveKit server webhooks — machine-to-machine, authenticated by the
  # signature on the request body, not by a user session.
  post "livekit/webhook" => "livekit_webhooks#create"

  get "contacts" => "contacts#index"
  get "chat_threads/:id" => "chat_threads#show", :constraints => { id: /\d+/ }
  get "r/:slug" => "page#show", :format => false
end

Discourse::Application.routes.draw do
  scope "/admin/plugins/resenha", constraints: AdminConstraint.new do
    scope format: false do
      get "/resenha-rooms" => "resenha/admin#index"
      get "/resenha-rooms/new" => "resenha/admin#new"
      get "/resenha-rooms/:id" => "resenha/admin#edit"
      get "/resenha-dashboard" => "resenha/admin#index"
    end

    scope format: :json do
      get "/rooms" => "resenha/admin_rooms#index"
      get "/rooms/:id" => "resenha/admin_rooms#show"
      post "/rooms" => "resenha/admin_rooms#create"
      put "/rooms/:id" => "resenha/admin_rooms#update"
      delete "/rooms/:id" => "resenha/admin_rooms#destroy"
      post "/rooms/:id/end_call" => "resenha/admin_rooms#end_call"

      get "/stats/overview" => "resenha/admin_stats#overview"
      get "/stats/rooms" => "resenha/admin_stats#rooms"
      get "/stats/users" => "resenha/admin_stats#users"
    end
  end
end
