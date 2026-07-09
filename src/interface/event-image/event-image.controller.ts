import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadEventImageUseCase } from '../../application/event-image/upload-event-image.usecase';
import { DeleteEventImageUseCase } from '../../application/event-image/delete-event-image.usecase';
import { ApiResponseService } from '../../shared/services/api-response.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { UploadEventImageDto } from './dto/upload-event-image.dto';
import { presentEventImage } from './event-image.presenter';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('events')
@ApiBearerAuth()
@Controller('events/:eventId/images')
export class EventImageController {
  constructor(
    private readonly uploadEventImageUseCase: UploadEventImageUseCase,
    private readonly deleteEventImageUseCase: DeleteEventImageUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('eventId') eventId: string,
    @Body() dto: UploadEventImageDto,
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const image = await this.uploadEventImageUseCase.execute({
      eventId,
      organizerId: user.organizerId,
      type: dto.type,
      caption: dto.caption,
      file: {
        buffer: file.buffer,
        filename: file.originalname,
        contentType: file.mimetype,
      },
    });
    return this.apiResponse.success('Image uploaded', presentEventImage(image));
  }

  @Permissions('ORGANIZER')
  @Delete(':imageId')
  async remove(
    @Param('eventId') eventId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.deleteEventImageUseCase.execute({
      eventId,
      imageId,
      organizerId: user.organizerId,
    });
    return this.apiResponse.success('Image deleted', null);
  }
}
