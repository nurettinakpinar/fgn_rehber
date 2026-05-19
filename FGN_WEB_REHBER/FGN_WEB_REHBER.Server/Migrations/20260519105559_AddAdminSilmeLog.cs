using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FGN_WEB_REHBER.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminSilmeLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminSilmeLoglari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SilinenKullaniciAdi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SilinenAd = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SilenKullaniciAdi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SilenAd = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IslemZamani = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminSilmeLoglari", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminSilmeLoglari");
        }
    }
}
