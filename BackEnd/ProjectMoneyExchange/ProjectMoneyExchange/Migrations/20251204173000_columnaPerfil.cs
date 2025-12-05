using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectMoneyExchange.Migrations
{
    /// <inheritdoc />
    public partial class columnaPerfil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Perfil_User",
                table: "USUARIO",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Perfil_User",
                table: "USUARIO");
        }
    }
}
