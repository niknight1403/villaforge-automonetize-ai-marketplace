resource "google_container_cluster" "ai_marketplace_cluster" {
  name     = "ai-marketplace-cluster"
  location = "europe-west3-a"

  remove_default_node_pool = true
  initial_node_count       = 1
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "ai-marketplace-node-pool"
  cluster    = google_container_cluster.ai_marketplace_cluster.name
  node_count = 3

  node_config {
    preemptible  = true
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}