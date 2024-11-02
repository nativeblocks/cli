package main

import (
	"fmt"
	"os"

	"github.com/nativeblocks/cli/cmd/auth"
	"github.com/nativeblocks/cli/cmd/organization"
	region "github.com/nativeblocks/cli/cmd/region"
	"github.com/spf13/cobra"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "nativeblocks",
		Short: "NativeBlocks CLI",
	}

	rootCmd.AddCommand(
		region.RegionCmd(),
		auth.AuthCmd(),
		organization.NewOrganizationCmd(),
	)
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
