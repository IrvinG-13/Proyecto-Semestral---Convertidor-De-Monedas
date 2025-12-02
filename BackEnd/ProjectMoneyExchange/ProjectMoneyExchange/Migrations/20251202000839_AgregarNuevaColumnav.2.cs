using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectMoneyExchange.Migrations
{
    /// <inheritdoc />
    public partial class AgregarNuevaColumnav2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NewRegistroMoneda",
                table: "MOVIMIENTO",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NewRegistroMoneda",
                table: "MOVIMIENTO");
        }
    }
}
