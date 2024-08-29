package handlers

import (
	"net/http"

	"os/exec"
)

// Restart service
// TODO get the service name from settings
func RestartService(w http.ResponseWriter, r *http.Request) {
	cmd := exec.Command("systemctl", "restart", "yt-dl")
	err := cmd.Run()
	if err != nil {
		http.Error(w, "Failed to create file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Service restarted!"))
}