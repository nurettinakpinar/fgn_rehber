using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FGN_WEB_REHBER.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddFotoUrlToEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FotoUrl",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FotoUrl",
                table: "Employees");
        }
    }
}
