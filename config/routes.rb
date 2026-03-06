# frozen_string_literal: true

Resenha::Engine.routes.draw do
  resources :rooms do
    member do
      post :join
      post :heartbeat
      delete :leave
      get :participants
      post :signal
      post :toggle_mute
      delete :kick
    end

    resources :memberships, controller: "room_memberships", only: %i[index create update destroy]
  end

  get "contacts" => "contacts#index"
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

      get "/stats/overview" => "resenha/admin_stats#overview"
      get "/stats/rooms" => "resenha/admin_stats#rooms"
      get "/stats/users" => "resenha/admin_stats#users"
    end
  end
end
