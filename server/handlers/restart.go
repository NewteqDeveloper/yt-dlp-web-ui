package handlers

import (
	"net/http"

	//"os"
	"os/exec"
)

// Restart service
func RestartService(w http.ResponseWriter, r *http.Request) {
	//filePath := "/app/new-file"
	err := touchFile()
	if err != nil {
		http.Error(w, "Failed to create file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Service restarted!"))
}

// Helper function to "touch" a file
//func touchFile(filePath string) error {
func touchFile() error {
	// Use os to create the file if it doesn't exist or update the modification time
	// if _, err := os.Stat(filePath); os.IsNotExist(err) {
	// 	_, err := os.Create(filePath)
	// 	return err
	// }
	// Use the "touch" command if you prefer to directly call it
	cmd := exec.Command("touch", "/app/touch.me.wtf")
	return cmd.Run()
}