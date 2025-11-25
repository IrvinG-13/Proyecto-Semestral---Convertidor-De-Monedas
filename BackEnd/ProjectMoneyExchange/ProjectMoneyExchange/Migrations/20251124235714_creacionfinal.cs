using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectMoneyExchange.Migrations
{
    /// <inheritdoc />
    public partial class creacionfinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MOVIMIENTO_USUARIO_Correo_User",
                table: "MOVIMIENTO");

            migrationBuilder.DropIndex(
                name: "IX_MOVIMIENTO_Correo_User",
                table: "MOVIMIENTO");

            migrationBuilder.DropColumn(
                name: "Correo_User",
                table: "MOVIMIENTO");

            migrationBuilder.AddColumn<int>(
                name: "ID_Billetera",
                table: "MOVIMIENTO",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "BILLETERA",
                columns: table => new
                {
                    ID_Billetera = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Saldo_Disponible = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MonedaActual = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Correo_User = table.Column<string>(type: "nvarchar(50)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BILLETERA", x => x.ID_Billetera);
                    table.ForeignKey(
                        name: "FK_BILLETERA_USUARIO_Correo_User",
                        column: x => x.Correo_User,
                        principalTable: "USUARIO",
                        principalColumn: "Correo_User",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MOVIMIENTO_ID_Billetera",
                table: "MOVIMIENTO",
                column: "ID_Billetera");

            migrationBuilder.CreateIndex(
                name: "IX_BILLETERA_Correo_User",
                table: "BILLETERA",
                column: "Correo_User",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MOVIMIENTO_BILLETERA_ID_Billetera",
                table: "MOVIMIENTO",
                column: "ID_Billetera",
                principalTable: "BILLETERA",
                principalColumn: "ID_Billetera",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MOVIMIENTO_BILLETERA_ID_Billetera",
                table: "MOVIMIENTO");

            migrationBuilder.DropTable(
                name: "BILLETERA");

            migrationBuilder.DropIndex(
                name: "IX_MOVIMIENTO_ID_Billetera",
                table: "MOVIMIENTO");

            migrationBuilder.DropColumn(
                name: "ID_Billetera",
                table: "MOVIMIENTO");

            migrationBuilder.AddColumn<string>(
                name: "Correo_User",
                table: "MOVIMIENTO",
                type: "nvarchar(50)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_MOVIMIENTO_Correo_User",
                table: "MOVIMIENTO",
                column: "Correo_User");

            migrationBuilder.AddForeignKey(
                name: "FK_MOVIMIENTO_USUARIO_Correo_User",
                table: "MOVIMIENTO",
                column: "Correo_User",
                principalTable: "USUARIO",
                principalColumn: "Correo_User",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
