using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FGN_WEB_REHBER.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddIsGizliToTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsGizli",
                table: "Takimlar",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsGizli",
                table: "Takimlar");
        }
    }
}
