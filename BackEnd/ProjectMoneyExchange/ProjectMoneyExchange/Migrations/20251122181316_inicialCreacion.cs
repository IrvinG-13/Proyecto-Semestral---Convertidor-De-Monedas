using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectMoneyExchange.Migrations
{
    /// <inheritdoc />
    public partial class inicialCreacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "USUARIO",
                columns: table => new
                {
                    Correo_User = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre_User = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    Apellido_User = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    Contraseña_User = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USUARIO", x => x.Correo_User);
                });

            migrationBuilder.CreateTable(
                name: "MOVIMIENTO",
                columns: table => new
                {
                    ID_Movimiento = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Categoria = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RegistroMoneda = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    TipoMovimiento = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Correo_User = table.Column<string>(type: "nvarchar(50)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MOVIMIENTO", x => x.ID_Movimiento);
                    table.ForeignKey(
                        name: "FK_MOVIMIENTO_USUARIO_Correo_User",
                        column: x => x.Correo_User,
                        principalTable: "USUARIO",
                        principalColumn: "Correo_User",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MOVIMIENTO_Correo_User",
                table: "MOVIMIENTO",
                column: "Correo_User");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MOVIMIENTO");

            migrationBuilder.DropTable(
                name: "USUARIO");
        }
    }
}
