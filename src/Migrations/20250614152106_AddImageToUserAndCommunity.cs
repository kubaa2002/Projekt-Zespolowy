using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Projekt_Zespolowy.Migrations
{
    /// <inheritdoc />
    public partial class AddImageToUserAndCommunity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CommunityImageId",
                table: "Communities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProfileImageId",
                table: "AspNetUsers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Communities_CommunityImageId",
                table: "Communities",
                column: "CommunityImageId",
                unique: true,
                filter: "[CommunityImageId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ProfileImageId",
                table: "AspNetUsers",
                column: "ProfileImageId",
                unique: true,
                filter: "[ProfileImageId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Images_ProfileImageId",
                table: "AspNetUsers",
                column: "ProfileImageId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Communities_Images_CommunityImageId",
                table: "Communities",
                column: "CommunityImageId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Images_ProfileImageId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_Communities_Images_CommunityImageId",
                table: "Communities");

            migrationBuilder.DropIndex(
                name: "IX_Communities_CommunityImageId",
                table: "Communities");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ProfileImageId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CommunityImageId",
                table: "Communities");

            migrationBuilder.DropColumn(
                name: "ProfileImageId",
                table: "AspNetUsers");
        }
    }
}
