using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectMoneyExchange.Migrations
{
    /// <inheritdoc />
    public partial class AgregarNuevaColumna : Migration
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
                    RegistroSaldo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    ID_Billetera = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MOVIMIENTO", x => x.ID_Movimiento);
                    table.ForeignKey(
                        name: "FK_MOVIMIENTO_BILLETERA_ID_Billetera",
                        column: x => x.ID_Billetera,
                        principalTable: "BILLETERA",
                        principalColumn: "ID_Billetera",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BILLETERA_Correo_User",
                table: "BILLETERA",
                column: "Correo_User",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MOVIMIENTO_ID_Billetera",
                table: "MOVIMIENTO",
                column: "ID_Billetera");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MOVIMIENTO");

            migrationBuilder.DropTable(
                name: "BILLETERA");

            migrationBuilder.DropTable(
                name: "USUARIO");
        }
    }
}
